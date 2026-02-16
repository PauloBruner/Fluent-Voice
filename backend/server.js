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
   FLUENTVOICE — VOZ PREMIUM PT-BR
================================ */

app.post("/api/fluentvoice/tts", async (req, res) => {
  const { text } = req.body;

  if (!GOOGLE_TTS_KEY) {
    return res.status(500).json({ error: "GOOGLE_TTS_KEY not configured" });
  }

  if (!text || text.trim().length === 0) {
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

    if (!response.ok) {
      console.error("Google TTS error:", data);
      return res.status(500).json({ error: "Google TTS failed" });
    }

    if (!data.audioContent) {
      return res.status(500).json({ error: "No audio returned" });
    }

    res.json({ audio: data.audioContent });

  } catch (err) {
    console.error("TTS Server Error:", err);
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
