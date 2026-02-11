const DAILY_LIMIT = 2;

const speakBtn = document.getElementById("speak");
const translateBtn = document.getElementById("translate");
const limitInfo = document.getElementById("limitInfo");

function todayKey() {
  return "fluentvoice_" + new Date().toISOString().split("T")[0];
}

function getUsage() {
  return parseInt(localStorage.getItem(todayKey())) || 0;
}

function incrementUsage() {
  localStorage.setItem(todayKey(), getUsage() + 1);
}

function canUsePremium() {
  return getUsage() < DAILY_LIMIT;
}

function updateLimitInfo() {
  limitInfo.textContent =
    `Premium uses today: ${getUsage()} / ${DAILY_LIMIT}`;
}

updateLimitInfo();

/* 🔊 LISTEN — FREE (Web Speech API) */
speakBtn.addEventListener("click", () => {
  const text = document.getElementById("text").value.trim();
  const lang = document.getElementById("language").value;
  const speed = document.getElementById("speed").value;

  if (!text) return alert("Enter a word or phrase.");

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = speed;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
});

/* 🌍 TRANSLATE EN → PT-BR — PREMIUM (LIMITED) */
translateBtn.addEventListener("click", async () => {
  const text = document.getElementById("text").value.trim();
  if (!text) return alert("Enter a word or phrase.");

  if (!canUsePremium()) {
    alert(
      "You reached the free daily limit (2 uses).\n\n" +
      "Upgrade to FluentVoice PRO for unlimited premium voice."
    );
    return;
  }

  incrementUsage();
  updateLimitInfo();

  try {
    const res = await fetch(
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(text) +
      "&langpair=en|pt"
    );

    const data = await res.json();
    const translated = data.responseData.translatedText;

    /* 🔥 PREMIUM VOICE (BACKEND REQUIRED) */
    const audioRes = await fetch("http://localhost:3000/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: translated, lang: "pt-BR" })
    });

    const audioData = await audioRes.json();
    const audio = new Audio(
      "data:audio/mp3;base64," + audioData.audio
    );
    audio.play();

  } catch {
    alert("Translation or voice service failed.");
  }
});
