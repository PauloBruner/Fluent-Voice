document.addEventListener("DOMContentLoaded", () => {

  const textArea = document.getElementById("text");
  const fromLang = document.getElementById("fromLang");
  const toLang = document.getElementById("toLang");
  const translateBtn = document.getElementById("translateBtn");
  const listenBtn = document.getElementById("listenBtn");
  const swapBtn = document.getElementById("swapBtn");
  const closeBtn = document.getElementById("closeBtn");

  swapBtn.addEventListener("click", () => {
    const temp = fromLang.value;
    fromLang.value = toLang.value;
    toLang.value = temp;
  });

  closeBtn.addEventListener("click", () => {
    window.parent.document.getElementById("fluentvoice-panel").remove();
  });

  translateBtn.addEventListener("click", async () => {
    const text = textArea.value.trim();
    if (!text) return;

    if (fromLang.value === toLang.value) return;

    const res = await fetch(
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(text) +
      "&langpair=" + fromLang.value + "|" + toLang.value
    );

    const data = await res.json();
    textArea.value = data.responseData.translatedText;
  });

  listenBtn.addEventListener("click", async () => {
    const text = textArea.value.trim();
    if (!text) return;

    // PT-BR usa voz neural backend
    if (toLang.value === "pt") {
      const response = await fetch(
        "https://SEU-DOMINIO.onrender.com/api/fluentvoice/tts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        }
      );

      const data = await response.json();
      const audio = new Audio("data:audio/mp3;base64," + data.audio);
      audio.play();

    } else {
      const utterance = new SpeechSynthesisUtterance(text);

      if (toLang.value === "en") utterance.lang = "en-US";
      if (toLang.value === "es") utterance.lang = "es-ES";

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  });

});
