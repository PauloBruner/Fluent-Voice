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

listenBtn.addEventListener("click", () => {
  const text = document.getElementById("text").value.trim();
  const toLang = document.getElementById("toLang").value;

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);

  if (toLang === "pt") utterance.lang = "pt-BR";
  if (toLang === "en") utterance.lang = "en-US";
  if (toLang === "es") utterance.lang = "es-ES";

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
});
