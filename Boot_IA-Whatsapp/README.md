# Agente Conversacional WhatsApp + Gemini

Este projeto conecta seu WhatsApp a um agente de IA (Google Gemini) que conversa
automaticamente com quem te chamar no privado.

⚠️ **Importante:** por segurança (evitar banimento do seu número), este bot foi
configurado para responder **apenas conversas privadas**, e não envia
mensagens automáticas em grupos. Isso está no código (`index.js`), então não
precisa se preocupar em configurar nada extra para isso.

---

## 1. Pré-requisitos

Você precisa ter o **Node.js** instalado. Para checar se já tem, abra o
PowerShell e rode:

```powershell
node --version
```

Se aparecer um erro ("não é reconhecido..."), baixe e instale o Node.js aqui:
https://nodejs.org (baixe a versão **LTS**).

---

## 2. Baixar e preparar o projeto

1. Extraia a pasta `whatsapp-gemini-bot` em algum lugar do seu computador
   (ex: `C:\Users\SeuNome\Documents\whatsapp-gemini-bot`).

2. Abra o PowerShell **nessa pasta**. Você pode fazer isso assim:
   - Abra o Explorador de Arquivos e navegue até a pasta
   - Clique na barra de endereço, digite `powershell` e aperte Enter

   Ou, alternativamente, abra o PowerShell normalmente e rode:

```powershell
cd "C:\Users\SeuNome\Documents\whatsapp-gemini-bot"
```

(troque pelo caminho real onde você extraiu a pasta)

---

## 3. Instalar as dependências

Dentro da pasta do projeto, rode:

```powershell
npm install
```

Isso vai baixar todas as bibliotecas necessárias (pode demorar 1-2 minutos).

---

## 4. Configurar sua chave da API do Gemini

1. Consiga uma chave gratuita em: https://aistudio.google.com/app/apikey
2. Na pasta do projeto, copie o arquivo de exemplo:

```powershell
Copy-Item .env.example .env
```

3. Abra o arquivo `.env` (pode abrir com o Bloco de Notas):

```powershell
notepad .env
```

4. Substitua `coloque_sua_chave_aqui` pela sua chave real do Gemini, salve e feche.

---

## 5. Rodar o bot

```powershell
npm start
```

Um **QR code** vai aparecer no terminal. Escaneie com o WhatsApp do seu
celular (Configurações → Aparelhos conectados → Conectar um aparelho).

Depois de conectar, você verá a mensagem:

```
✅ Assistente está online e conectado ao WhatsApp!
```

Pronto! Agora, quando alguém mandar mensagem no seu privado, o Gemini vai
responder automaticamente.

---

## 6. Parar o bot

No terminal onde ele está rodando, aperte:

```
Ctrl + C
```

---

## 7. Personalizando o agente

Abra o arquivo `.env` e edite:

- `BOT_NAME` → nome do agente (aparece só nos logs do terminal)
- `BOT_PERSONA` → como o agente deve se comportar/responder. Exemplos:
  - `"Você é um assistente técnico que responde de forma objetiva e curta."`
  - `"Você é simpático, usa emojis e responde em tom descontraído."`

Depois de editar, pare o bot (Ctrl+C) e rode `npm start` de novo.

---

## Dúvidas comuns

**O QR code não aparece direito no terminal.**
Aumente o tamanho da janela do PowerShell ou use o Terminal do Windows
(Windows Terminal), que renderiza melhor.

**Erro de "sessão desconectada".**
Apague a pasta `.wwebjs_auth` que foi criada no projeto e rode `npm start`
de novo para gerar um novo QR code.

**Posso usar esse bot para postar em grupos automaticamente?**
Não — o código foi feito propositalmente para ignorar grupos, pois enviar
mensagens automáticas em grupos viola os Termos de Uso do WhatsApp e pode
banir seu número permanentemente. Ele foi pensado para atendimento/conversa
1-a-1, que é um uso seguro e permitido.
