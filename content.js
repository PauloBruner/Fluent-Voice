if (window.fluentVoiceLoaded) {
  // já carregado, não reexecuta
} else {

window.fluentVoiceLoaded = true;
}

chrome.runtime.onMessage.addListener((request) => {

  if (!request.toggleFluentVoice) return;

  // Se já existe, fecha
  const existing = document.getElementById("fluentvoice-panel");

  if (existing) {
    existing.remove();
    return;
  }

  // Se não existe, cria
  createPanel();
});

function createPanel() {

  panel = document.createElement("div");
  panel.id = "fluentvoice-panel";

  panel.innerHTML = `
    <div class="fv-header">
      FluentVoice
      <button id="fv-close">✕</button>
    </div>

    <textarea id="fv-text" placeholder="Type or paste text..."></textarea>

    <div class="fv-selectors">

      <div class="dropdown" data-target="fromLang">
        <div class="dropdown-selected">English</div>
        <div class="dropdown-list">
          <div class="dropdown-item" data-value="en">English</div>
          <div class="dropdown-item" data-value="pt">Portuguese (Brazil)</div>
          <div class="dropdown-item" data-value="es">Spanish</div>
        </div>
      </div>

      <button id="fv-swap">⇄</button>

      <div class="dropdown" data-target="toLang">
        <div class="dropdown-selected">Portuguese (Brazil)</div>
        <div class="dropdown-list">
          <div class="dropdown-item" data-value="pt">Portuguese (Brazil)</div>
          <div class="dropdown-item" data-value="en">English</div>
          <div class="dropdown-item" data-value="es">Spanish</div>
        </div>
      </div>

    </div>

    <div class="fv-buttons">
      <button id="fv-translate" class="primary">Translate</button>
      <button id="fv-listen" class="secondary">Listen</button>
    </div>

    <div class="fv-footer">
      <a href="https://SEU-SITE.com/privacy.html" target="_blank">
        Privacy Policy
      </a>
    </div>
  `;

  document.body.appendChild(panel);
  applyStyles();
  attachEvents();
  createMiniButton();

}

function createMiniButton() {

  if (document.getElementById("fv-mini")) return;

  const mini = document.createElement("div");
  mini.id = "fv-mini";
  mini.innerHTML = "🎧";

  mini.style.position = "fixed";
  mini.style.bottom = "40px";
  mini.style.right = "40px";
  mini.style.width = "55px";
  mini.style.height = "55px";
  mini.style.background = "linear-gradient(135deg,#ff6a00,#ff8c1a)";
  mini.style.borderRadius = "50%";
  mini.style.display = "flex";
  mini.style.alignItems = "center";
  mini.style.justifyContent = "center";
  mini.style.cursor = "pointer";
  mini.style.boxShadow = "0 10px 25px rgba(0,0,0,0.4)";
  mini.style.zIndex = "999998";
  mini.style.fontSize = "22px";

  mini.onclick = () => {

    const existing = document.getElementById("fluentvoice-panel");

    if (existing) {
      existing.remove();
    } else {
      createPanel();
    }

  };

  document.body.appendChild(mini);
}

function applyStyles() {

  const style = document.createElement("style");

  style.textContent = `
    #fluentvoice-panel {
      position: fixed;
      top: 70px;
      right: 30px;
      width: 420px;
      min-height: 520px;
      backdrop-filter: blur(18px);
      background: rgba(18,18,20,0.95);
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 30px 70px rgba(0,0,0,0.65);
      z-index: 999999;
      font-family: "Segoe UI", Arial, sans-serif;
      color: #ffffff;
    }

    .fv-header {
      text-align: center;
      font-weight: 700;
      font-size: 18px;
      margin-bottom: 20px;
      position: relative;
    }

    #fv-close {
      position: absolute;
      right: 0;
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
    }

    #fv-close:hover {
      color: #ff6a00;
    }

    textarea {
      width: 100%;
      height: 170px;
      padding: 16px;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.06);
      color: #ffffff;
      resize: vertical;
      margin-bottom: 20px;
      font-size: 15px;
    }

    .fv-selectors {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .dropdown {
      position: relative;
      width: 42%;
      cursor: pointer;
    }

    .dropdown-selected {
      padding: 10px 14px;
      border-radius: 14px;
      background: #2a2a2e;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .dropdown-list {
      position: absolute;
      top: 110%;
      left: 0;
      width: 100%;
      background: #1c1c1f;
      border-radius: 14px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.6);
      overflow: hidden;
      display: none;
      z-index: 999;
    }

    .dropdown.open .dropdown-list {
      display: block;
    }

    .dropdown-item {
      padding: 10px 14px;
      transition: 0.2s ease;
    }

    .dropdown-item:hover {
      background: #ff6a00;
    }

    #fv-swap {
      width: 12%;
      border-radius: 14px;
      background: rgba(255,255,255,0.1);
      color: #ff6a00;
      border: none;
      cursor: pointer;
    }

    .fv-buttons button {
      width: 48%;
      padding: 12px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
    }

    .primary {
      background: linear-gradient(135deg,#ff6a00,#ff8c1a);
      color: white;
    }

    .secondary {
      background: rgba(255,255,255,0.08);
      color: white;
    }

    .fv-footer {
      text-align: center;
      font-size: 12px;
      margin-top: 10px;
    }

    .fv-footer a {
      color: #ff6a00;
      text-decoration: none;
    }
  `;

  document.head.appendChild(style);
}

function attachEvents() {

  let selectedLanguages = { fromLang: "en", toLang: "pt" };

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

  document.getElementById("fv-close").onclick = () => {
    panel.remove();
    panel = null;
    createMiniButton();
  };

  document.getElementById("fv-swap").onclick = () => {
    const temp = selectedLanguages.fromLang;
    selectedLanguages.fromLang = selectedLanguages.toLang;
    selectedLanguages.toLang = temp;
  };

  document.getElementById("fv-translate").onclick = async () => {

    const btn = document.getElementById("fv-translate");
    const text = document.getElementById("fv-text").value.trim();
    if (!text) return;

    btn.classList.add("loading");

    try {

      const res = await fetch(
        "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(text) +
        "&langpair=" + selectedLanguages.fromLang + "|" + selectedLanguages.toLang
      );

      const data = await res.json();
      document.getElementById("fv-text").value =
        data.responseData.translatedText;

    } catch (err) {
      console.error(err);
    }

    btn.classList.remove("loading");
  };

  document.getElementById("fv-listen").onclick = async () => {

    const text = document.getElementById("fv-text").value.trim();
    if (!text) return;

    if (selectedLanguages.toLang === "pt") {

      const response = await fetch(
        "https://fluentvoice-backend.onrender.com/api/fluentvoice/tts",
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
      if (selectedLanguages.toLang === "en") utterance.lang = "en-US";
      if (selectedLanguages.toLang === "es") utterance.lang = "es-ES";
      speechSynthesis.speak(utterance);
    }
  };
}

