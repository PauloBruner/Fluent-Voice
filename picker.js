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
  dropdowns[0].querySelector(".dropdown-selected").textContent =
    dropdowns[1].querySelector(".dropdown-selected").textContent;

  dropdowns[1].querySelector(".dropdown-selected").textContent =
    dropdowns[0].querySelector(".dropdown-selected").textContent;
});

/* TRANSLATE */
translateBtn.addEventListener("click", async () => {

  const text = textInput.value.trim();
  if (!text) return;

  const res = await fetch(
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(text) +
    "&langpair=" + selectedLanguages.fromLang + "|" + selectedLanguages.toLang
  );

  const data = await res.json();
  textInput.value = data.responseData.translatedText;
});

/* LISTEN */
listenBtn.addEventListener("click", async () => {

  const text = textInput.value.trim();
  if (!text) return;

  if (selectedLanguages.toLang === "pt") {

    const response = await fetch(
      "https://SEU-DOMINIO.onrender.com/api/fluentvoice/tts",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      }
    );

    const data = await response.json();

    if (!data.audio) {
      alert("Voice error");
      return;
    }

    const audio = new Audio("data:audio/mp3;base64," + data.audio);
    audio.play();

  } else {

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedLanguages.toLang === "en") utterance.lang = "en-US";
    if (selectedLanguages.toLang === "es") utterance.lang = "es-ES";

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
});
