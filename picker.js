const textInput = document.getElementById("textInput");
const translateBtn = document.getElementById("translateBtn");
const listenBtn = document.getElementById("listenBtn");
const swapBtn = document.getElementById("swapBtn");

let selectedLanguages = {
  fromLang: "en",
  toLang: "pt"
};

/* DROPDOWN */
document.querySelectorAll(".dropdown").forEach(dropdown => {

  const selected = dropdown.querySelector(".dropdown-selected");
  const target = dropdown.dataset.target;

  selected.addEventListener("click", () => {
    document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
    dropdown.classList.toggle("open");
  });

  dropdown.querySelectorAll(".dropdown-item").forEach(item => {
    item.addEventListener("click", () => {
      selected.textContent = item.textContent;
      selectedLanguages[target] = item.dataset.value;
      dropdown.classList.remove("open");
    });
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
  }
});

/* SWAP */
swapBtn.addEventListener("click", () => {
  const temp = selectedLanguages.fromLang;
  selectedLanguages.fromLang = selectedLanguages.toLang;
  selectedLanguages.toLang = temp;

  const dropdowns = document.querySelectorAll(".dropdown");
  const fromLabel = dropdowns[0].querySelector(".dropdown-selected");
  const toLabel = dropdowns[1].querySelector(".dropdown-selected");

  const tempText = fromLabel.textContent;
  fromLabel.textContent = toLabel.textContent;
  toLabel.textContent = tempText;
});

/* TRANSLATE */
translateBtn.addEventListener("click", async () => {

  const text = textInput.value.trim();
  if (!text) return;

  try {

    const res = await fetch(
      "https://fluentvoice-backend.onrender.com/api/fluentvoice/translate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          fromLang: selectedLanguages.fromLang,
          toLang: selectedLanguages.toLang
        })
      }
    );

    const data = await res.json().catch(() => ({}));

    if (res.status === 429) {
      alert("Daily translation limit reached. Please try again tomorrow.");
      return;
    }

    if (!res.ok || !data.translatedText) {
      alert("Translation error. Please try again later.");
      return;
    }

    textInput.value = data.translatedText;

  } catch (err) {
    console.error(err);
    alert("Translation error. Please check your connection and try again.");
  }
});

/* LISTEN */
listenBtn.addEventListener("click", async () => {

  const text = textInput.value.trim();
  if (!text) return;

  if (selectedLanguages.toLang === "pt") {

    try {

      const response = await fetch(
        "https://fluentvoice-backend.onrender.com/api/fluentvoice/tts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 429) {
        alert("Daily voice limit reached. Please try again tomorrow.");
        return;
      }

      if (!response.ok || !data.audio) {
        alert("Voice error. Please try again later.");
        return;
      }

      const audio = new Audio("data:audio/mp3;base64," + data.audio);
      audio.play();

    } catch (err) {
      console.error(err);
      alert("Voice error. Please check your connection and try again.");
    }

  } else {

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedLanguages.toLang === "en") utterance.lang = "en-US";
    if (selectedLanguages.toLang === "es") utterance.lang = "es-ES";

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
});
