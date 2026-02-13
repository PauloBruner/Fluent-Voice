import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

/* 🔥 CORS EXPLÍCITO PARA EXTENSÃO */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

/* ===============================
   CONFIGURAÇÕES GERAIS
================================ */

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_TTS_KEY = process.env.GOOGLE_TTS_KEY;
const FREE_LIMIT = parseInt(process.env.FREE_LIMIT || "2", 10);

/* ===============================
   ROTA RAIZ
================================ */

app.get("/", (req, res) => {
  res.send("CompraCerta IA + FluentVoice backend ativo 🚀");
});

/* ===============================
   COMPRA FÁCIL IA (JÁ EXISTENTE)
================================ */

app.post("/analyze", async (req, res) => {
  try {
    const { title, price, site, usageCount } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: "Dados insuficientes" });
    }

    if (usageCount >= FREE_LIMIT) {
      return res.json({
        limitReached: true,
        message:
          "Você atingiu o limite diário gratuito. Desbloqueie análises ilimitadas para continuar."
      });
    }

    const prompt = `
Você é um assistente que ajuda consumidores a avaliar produtos.

A análise deve ser baseada em:
- padrões comuns de mercado
- características gerais do produto
- opiniões frequentes de consumidores em produtos semelhantes

⚠️ Não cite comentários específicos de sites.
⚠️ Não afirme preços de outras lojas.
⚠️ Use linguagem neutra e informativa.

Responda EXATAMENTE neste formato:

RESUMO:
(frase curta)

PROS:
- item
- item
- item

CONTRAS:
- item
- item

VEREDITO:
(frase neutra)

Produto: ${title}
Preço exibido: ${price}
Site atual: ${site}
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4
        })
      }
    );

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: "IA sem resposta" });
    }

    const encoded = encodeURIComponent(title);

    res.json({
      analysis: text,
      affiliates: {
        amazon: `https://www.amazon.com.br/s?k=${encoded}&tag=precafacil-20`,
        shopee: `https://shopee.com.br/search?keyword=${encoded}`,
        magalu: `https://www.magazinevoce.com.br/magazinepcvendedor/busca/${encoded}/`,
        mercadolivre: `https://www.mercadolivre.com.br/jm/search?as_word=${encoded}`
      },
      remaining: FREE_LIMIT - (usageCount + 1)
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno IA" });
  }
});

/* ===============================
   FLUENTVOICE — VOZ PREMIUM PT-BR
================================ */

app.post("/api/fluentvoice/tts", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Texto é obrigatório" });
  }

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "pt-BR",
            name: "pt-BR-Neural2-B"
          },
          audioConfig: {
            audioEncoding: "MP3"
          }
        })
      }
    );

    const data = await response.json();

    if (!data.audioContent) {
      return res.status(500).json({ error: "Falha ao gerar áudio" });
    }

    res.json({ audio: data.audioContent });

  } catch (err) {
    res.status(500).json({ error: "Erro no FluentVoice TTS" });
  }
});

/* ===============================
   SERVIDOR
================================ */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log("Servidor rodando na porta", PORT)
);
