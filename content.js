let panel = null;

chrome.runtime.onMessage.addListener((request) => {
  if (request.toggle) {
    if (panel) {
      panel.remove();
      panel = null;
    } else {
      createPanel();
    }
  }
});

function createPanel() {
  panel = document.createElement("div");
  panel.id = "fluentvoice-panel";

  panel.innerHTML = `
    <div class="header">
      FluentVoice
      <button id="closeFV">✕</button>
    </div>
    <textarea id="fv-text" placeholder="Select text or type..."></textarea>
    <div class="controls">
      <button id="fv-translate">Translate</button>
      <button id="fv-listen">Listen</button>
    </div>
  `;

  document.body.appendChild(panel);

  applyStyles();

  const selected = window.getSelection().toString();
  if (selected) {
    document.getElementById("fv-text").value = selected;
  }

  document.getElementById("closeFV").onclick = () => {
    panel.remove();
    panel = null;
  };

  document.getElementById("fv-listen").onclick = () => {
    const text = document.getElementById("fv-text").value;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  document.getElementById("fv-translate").onclick = async () => {
    const text = document.getElementById("fv-text").value;

    const res = await fetch(
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(text) +
      "&langpair=en|pt"
    );

    const data = await res.json();
    document.getElementById("fv-text").value =
      data.responseData.translatedText;
  };
}

function applyStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #fluentvoice-panel {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 300px;
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      border-radius: 8px;
      z-index: 999999;
      padding: 10px;
      font-family: Arial;
    }
    #fluentvoice-panel textarea {
      width: 100%;
      height: 70px;
      margin: 8px 0;
    }
    #fluentvoice-panel .header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
}
