chrome.runtime.onMessage.addListener((request) => {
  if (request.openPrivacy) {
    chrome.tabs.create({
      url: "https://paulobruner.github.io/Fluent-Voice/privacy.html"
    });
  }
});

chrome.action.onClicked.addListener(async (tab) => {

  if (!tab.url ||
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("about:")
  ) {
    return;
  }

  try {

    // Tenta enviar mensagem primeiro
    await chrome.tabs.sendMessage(tab.id, {
      toggleFluentVoice: true
    });

  } catch (err) {

    // Se não existir listener, injeta
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    // Envia novamente
    await chrome.tabs.sendMessage(tab.id, {
      toggleFluentVoice: true
    });

  }
});
