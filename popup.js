const translateBtn = document.getElementById("translate");
const listenBtn = document.getElementById("listen");

let lastTranslatedText = "";

translateBtn.addEventListener("click", async () => {
  const text = document.getElementById("text").value.trim();
  const fromLang = document.getElementById("fromLang").value;
  const toLang = document.getElementById("toLang").value;

  if (!text) return alert("Please enter text.");

  if (fromLang === toLang) {
    lastTranslatedText = text;
    return;
  }

  try {
    const res = await fetch(
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(text) +
      "&langpair=" + fromLang + "|" + toLang
    );

    const data = await res.json();
    const translated = data.responseData.translatedText;

    document.getElementById("text").value = translated;
    lastTranslatedText = translated;

  } catch {
    alert("Translation failed.");
  }
});

listenBtn.addEventListener("click", async () => {
  const text = document.getElementById("text").value.trim();
  const toLang = document.getElementById("toLang").value;

  if (!text) return;

  // Se for português brasileiro, usa voz neural
  if (toLang === "pt") {
    try {
      const response = await fetch(
        "https://fluentvoice-backend.onrender.com/api/fluentvoice/tts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text })
        }
      );

      const data = await response.json();

      if (!data.audio) {
        alert("Voice generation failed.");
        return;
      }

      const audio = new Audio(
        "data:audio/mp3;base64," + data.audio
      );
      audio.play();

    } catch {
      alert("Premium voice service unavailable.");
    }

  } else {
    // Outros idiomas continuam usando Web Speech
    const utterance = new SpeechSynthesisUtterance(text);

    if (toLang === "en") utterance.lang = "en-US";
    if (toLang === "es") utterance.lang = "es-ES";

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
});

