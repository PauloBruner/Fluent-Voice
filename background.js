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
