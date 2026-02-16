let fvPanel = null;

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
    <iframe src="${chrome.runtime.getURL("picker.html")}" 
      style="width:100%;height:100%;border:none;"></iframe>
  `;

  document.body.appendChild(fvPanel);
  applyStyles();
}

function applyStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #fluentvoice-panel {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 340px;
      height: 420px;
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      border-radius: 10px;
      z-index: 999999;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}
