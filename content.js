if (!window.fvInitialized) {

window.fvInitialized = true;
window.fvPanel = null;
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.toggleFluentVoice) {
    if (fvPanel) {
      fvPanel.remove();
      fvPanel = null;
    } else {
      createPanel();
    }
  }
});

function createPanel() {

  fvPanel = document.createElement("div");
  fvPanel.id = "fluentvoice-panel";

  fvPanel.innerHTML = `
    <div class="fv-header">
      <span>FluentVoice</span>
      <button id="fv-close">✕</button>
    </div>

    <textarea id="fv-text" placeholder="Select text or type..."></textarea>

    <div class="fv-selectors">
      <select id="fv-from">
        <option value="en">English</option>
        <option value="pt">Portuguese (Brazil)</option>
        <option value="es">Spanish</option>
      </select>

      <button id="fv-swap">⇄</button>

      <select id="fv-to">
        <option value="pt">Portuguese (Brazil)</option>
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>
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

  document.body.appendChild(fvPanel);
  applyStyles();
  attachEvents();

  const selected = window.getSelection().toString();
  if (selected) {
    document.getElementById("fv-text").value = selected;
  }
}

function applyStyles() {

  const style = document.createElement("style");

  style.textContent = `

    #fluentvoice-panel {
      position: fixed;
      top: 80px;
      right: 30px;
      width: 380px;
      backdrop-filter: blur(18px);
      background: rgba(18,18,20,0.85);
      border-radius: 20px;
      padding: 22px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.05);
      z-index: 999999;
      font-family: "Segoe UI", Arial, sans-serif;
      color: #ffffff;
      animation: fvFadeIn 0.3s ease;
    }

    @keyframes fvFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fv-header {
      text-align: center;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      position: relative;
      color: #ffffff;
    }

    #fv-close {
      position: absolute;
      right: 0;
      top: 0;
      border: none;
      background: transparent;
      color: #888;
      cursor: pointer;
      font-size: 16px;
    }

    #fv-close:hover {
      color: #ff6a00;
    }

    textarea {
      width: 100%;
      height: 95px;
      padding: 12px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.05);
      color: #ffffff;
      resize: none;
      margin-bottom: 14px;
      font-size: 14px;
      outline: none;
    }

    textarea::placeholder {
      color: #aaa;
    }

    .fv-selectors {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .fv-selectors select {
      width: 42%;
      padding: 8px;
      border-radius: 12px;
      border: none;
      background: rgba(255,255,255,0.08);
      color: #fff;
      outline: none;
    }

    #fv-swap {
      width: 12%;
      border-radius: 12px;
      border: none;
      background: rgba(255,255,255,0.1);
      color: #ff6a00;
      cursor: pointer;
      font-size: 16px;
      transition: 0.2s;
    }

    #fv-swap:hover {
      background: rgba(255,106,0,0.2);
    }

    .fv-buttons {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .fv-buttons button {
      width: 48%;
      padding: 12px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: 0.3s ease;
    }

    .primary {
      background: linear-gradient(135deg,#ff6a00,#ff8c1a);
      color: #fff;
      box-shadow: 0 0 15px rgba(255,106,0,0.4);
    }

    .primary:hover {
      box-shadow: 0 0 25px rgba(255,106,0,0.8);
      transform: translateY(-2px);
    }

    .secondary {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }

    .secondary:hover {
      background: rgba(255,255,255,0.15);
    }

    .fv-footer {
      text-align: center;
      font-size: 11px;
      color: #999;
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

  const textArea = document.getElementById("fv-text");
  const fromLang = document.getElementById("fv-from");
  const toLang = document.getElementById("fv-to");

  document.getElementById("fv-close").onclick = () => {
    fvPanel.remove();
    fvPanel = null;
  };

  document.getElementById("fv-swap").onclick = () => {
    const temp = fromLang.value;
    fromLang.value = toLang.value;
    toLang.value = temp;
  };

  document.getElementById("fv-translate").onclick = async () => {
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
  };

  document.getElementById("fv-listen").onclick = async () => {
    const text = textArea.value.trim();
    if (!text) return;

    // 🔥 Português usa voz neural backend
    if (toLang.value === "pt") {

      const response = await fetch(
        "https://fluentvoice-backend.onrender.com/api/fluentvoice/tts",
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

      if (toLang.value === "en") utterance.lang = "en-US";
      if (toLang.value === "es") utterance.lang = "es-ES";

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };
}
